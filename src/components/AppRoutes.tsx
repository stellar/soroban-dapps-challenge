import { Route, Routes } from "react-router-dom";
import Layout from "./Layout.tsx";
import PairDetails from "./Pairs/PairDetails.tsx";
import { NotFoundPage } from "@/pages/Share/NotFoundPage.tsx";
import { oracle } from "@/shared/contracts.ts";
import { PairsList } from "./Pairs/PairsList.tsx";
import Mint from "@/components/Forms/Mint.tsx";
import Donate from "@/components/Forms/Donate.tsx";

const routes = [
  { element: <PairsList />, path: "/" },
  { element: <PairsList />, path: "/home" },
  { element: <PairDetails contract={oracle} />, path: "/BTC_USDT" },
  { element: <Mint />, path: "/mint/btc" },
  { element: <Donate />, path: "/donation/btc" },
  { element: <NotFoundPage />, path: "/*" },
];

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {routes?.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
