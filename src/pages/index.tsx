import ZkForm from "./components/form";
import Homex from "./components/Home";
import { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <Homex />
    </div>
  );
}
