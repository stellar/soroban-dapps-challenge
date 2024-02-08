import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { HelloWorld } from "../components/organisms";
import { WalletData } from "../components/molecules";

const Home: NextPage = () => {
  return (
    <>
      <header className={styles.header}>
        <h3>Soroban Quickstart Dapp</h3>
        <WalletData />
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          <HelloWorld />
        </div>
      </main>
    </>
  );
};

export default Home;
