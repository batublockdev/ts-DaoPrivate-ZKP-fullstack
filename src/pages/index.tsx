import ZkForm from "./components/form";
import FormSwitcher from "./components/FormSwitcher";
export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-8">ZK Proof Verification</h1>
      <FormSwitcher />
    </div>
  );
}
