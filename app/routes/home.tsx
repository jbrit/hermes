import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hermes" },
    { name: "description", content: "An evm <-> stellar fusion+ implementation." },
  ];
}

export default function Home() {
  return <Welcome />;
}
