import ArbitrageCalculator from "../components/ArbitrageCalculator";

export default function Home() {
  return (
    <div className="min-h-screen mx-auto max-w-5xl w-full p-6 md:p-10 space-y-8">
      <ArbitrageCalculator />
      <p className="text-center text-xs text-gray-500">Educational tool. Verify legality and odds sources before betting.</p>
    </div>
  );
}
