import React, { useState, useEffect } from "react";
import { Card } from "../../atoms";
import { helloWorld } from '../../../shared/contracts'
import styles from "./style.module.css";

const HelloWorld = () => {
  const [to, setTo] = useState("");
  const [count, setCount] = useState("");
  const [incr, setIncr] = useState("");
  const [newIncrement, setNewIncrement] = useState("");
  const [message, setMessage] = useState([""]);
  const [incrementSuccess, setIncrementSuccess] = useState(false); // New state for tracking increment success


  const handleHello = async () => {
    try {
      const helloTx = (await helloWorld.hello({ to }, { fee: 100 }));
      await helloTx.signAndSend();
      console.log(`hello, ${to}`);
    } catch (error) {
      console.error("Error calling hello:", error);
    }
  };

  const handleIncrement = async () => {
    try {
      const incrementTx = await helloWorld.increment({ incr: Number(incr) }, { fee: 100 });
      await incrementTx.signAndSend();
      console.log(`incremented by ${incr}`);
      setIncrementSuccess(true); // Set success state to true on successful increment
    } catch (error) {
      console.error("Error calling increment:", error);
      setIncrementSuccess(false); // Set success state to false on error
    }
  };

  const handleGetMessage = async () => {
    try {
      const response = (await helloWorld.getMessage()).result;
      setMessage(response);
    } catch (error) {
      console.error("Error getting state:", error);
    }
  };

  const handleGetLastIncrement = async () => {
    try {
      const response = (await helloWorld.getLastIncrement()).result;
      setNewIncrement(response.toString());
      console.log(`Last increment: ${response}`);
    } catch (error) {
      console.error("Error getting last increment:", error);
    }
  };

  const handleGetCount = async () => {
    try {
      const response = (await helloWorld.getCount()).result;
      setCount(response.toString());
      console.log(`Count: ${response}`);
    } catch (error) {
      console.error("Error getting count:", error);
    }
  };

  return (
    <div>
      <Card>
      <h2>Call Contract Functions</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Recipient:</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleHello} className={styles.button}>Write Message</button>
        </div>
        <br />
        <br />
        <div className={styles.formGroup}>
          <label className={styles.label}>Increment:</label>
          <input
            type="number"
            value={incr}
            onChange={(e) => setIncr(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleIncrement} className={styles.button}>Increment</button>
        </div>
      </Card>

      {/* Next section here */}
      <div>
        <Card>
        <h2>Get Contract State Variables</h2>
          <button onClick={handleGetMessage} className={styles.button}>Get Message</button>
          <div>
          <strong className={styles.strongText}>Message:</strong>
            <br />
            <pre className={styles.preFormattedText}>{`${message}`}</pre>
          </div>
          <br />
          {/* Next section here */}

          <div>
            <button onClick={handleGetLastIncrement} className={styles.button}>Get Last Increment</button>
            <div>
              <strong className={styles.strongText}>Last Increment:</strong>
              <pre className={styles.preFormattedText}>{newIncrement}</pre>
            </div>
          </div>
          {/* Next section here */}
          <div>
            <button onClick={handleGetCount} className={styles.button}>Get Count</button>
            <div>
              <strong className={styles.strongText}>Current Count:</strong>
              <pre className={styles.preFormattedText}>{count}</pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export { HelloWorld };
