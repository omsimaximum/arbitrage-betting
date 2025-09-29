"use client";
import { RefreshCw } from "lucide-react";
import React from "react";
import { calculateArbitrage, formatCurrency } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const marketTypes = ["Win/Lose", "Over/Under", "Odd/Even", "Handicap"];

interface OddsState {
	totalStake: string;
	marketType: string;
	bookA: { option1: string; option2: string };
	bookB: { option1: string; option2: string };
	lastUpdated: number;
}

export const ArbitrageCalculator: React.FC = () => {
	const [state, setState] = React.useState<OddsState>({
		totalStake: "0",
		marketType: marketTypes[0],
		bookA: { option1: "0.00", option2: "0.00" },
		bookB: { option1: "0.00", option2: "0.00" },
		lastUpdated: Date.now(),
	});

	const parsed = {
		totalStake: parseFloat(state.totalStake) || 0,
		marketType: state.marketType,
		bookA: {
			option1: parseFloat(state.bookA.option1) || null,
			option2: parseFloat(state.bookA.option2) || null,
		},
		bookB: {
			option1: parseFloat(state.bookB.option1) || null,
			option2: parseFloat(state.bookB.option2) || null,
		},
	};

	const { combinations, best, hasProfitable } = calculateArbitrage({ ...parsed });

	function handleChange(path: string, value: string) {
		setState(prev => {
			const clone: any = { ...prev };
			const segments = path.split(".");
			let cursor = clone;
			for (let i = 0; i < segments.length - 1; i++) cursor = cursor[segments[i]];
			cursor[segments[segments.length - 1]] = value;
			return { ...clone };
		});
	}

	function refreshOdds() {
		setState(prev => ({
			...prev,
			// Reset all numeric fields to 0
			totalStake: "0",
			bookA: { option1: "0", option2: "0" },
			bookB: { option1: "0", option2: "0" },
			lastUpdated: Date.now(),
		}));
	}

	return (
		<div className="w-full flex flex-col gap-6">
			<Card>
				<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
					<CardTitle>Arbitrage Betting Calculator</CardTitle>
					<button
						type="button"
						onClick={refreshOdds}
						aria-label="Refresh and reset"
						className="btn-ghost !border-[rgb(var(--border))] hover:bg-[rgb(245_247_248)] dark:hover:bg-neutral-800"
					>
						<RefreshCw className="h-4 w-4" /> <span className="hidden sm:inline">Refresh</span>
					</button>
				</CardHeader>
				<CardContent>
					<form className="grid gap-4 md:grid-cols-2" onSubmit={e => e.preventDefault()}>
						<div className="space-y-2">
							<label className="text-sm font-medium">Market Type</label>
							<select
								value={state.marketType}
								onChange={e => handleChange("marketType", e.target.value)}
								className="w-full px-3 py-2 text-sm"
							>
								{marketTypes.map(mt => (
									<option key={mt} value={mt}>
										{mt}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Total Stake (₱)</label>
							<input
								type="number"
								min={0}
								step="0.01"
								value={state.totalStake}
								onChange={e => handleChange("totalStake", e.target.value)}
								className="w-full px-3 py-2 text-sm"
							/>
						</div>
						<fieldset className="space-y-2">
							<legend className="text-sm font-semibold">Bookmaker A Odds</legend>
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<label className="text-xs text-gray-600 dark:text-gray-400">Option 1</label>
									<input
										type="number"
										step="0.01"
										value={state.bookA.option1}
										onChange={e => handleChange("bookA.option1", e.target.value)}
										className="w-full px-2 py-1.5 text-sm"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-xs text-gray-600 dark:text-gray-400">Option 2</label>
									<input
										type="number"
										step="0.01"
										value={state.bookA.option2}
										onChange={e => handleChange("bookA.option2", e.target.value)}
										className="w-full px-2 py-1.5 text-sm"
									/>
								</div>
							</div>
						</fieldset>
						<fieldset className="space-y-2">
							<legend className="text-sm font-semibold">Bookmaker B Odds</legend>
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<label className="text-xs text-gray-600 dark:text-gray-400">Option 1</label>
									<input
										type="number"
										step="0.01"
										value={state.bookB.option1}
										onChange={e => handleChange("bookB.option1", e.target.value)}
										className="w-full px-2 py-1.5 text-sm"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-xs text-gray-600 dark:text-gray-400">Option 2</label>
									<input
										type="number"
										step="0.01"
										value={state.bookB.option2}
										onChange={e => handleChange("bookB.option2", e.target.value)}
										className="w-full px-2 py-1.5 text-sm"
									/>
								</div>
							</div>
						</fieldset>
					</form>
				</CardContent>
			</Card>

			<div className="grid md:grid-cols-2 gap-6 items-start">
				<Card className="order-2 md:order-1">
					<CardHeader>
						<CardTitle>Combinations</CardTitle>
					</CardHeader>
						<CardContent className="space-y-4">
							{combinations.length === 0 && (
								<p className="text-sm text-gray-500">Enter valid odds to see combinations.</p>
							)}
							{combinations.map(c => {
								const isBest = best?.id === c.id;
								return (
									<div
										key={c.id}
										className={`rounded-lg border p-3 text-sm flex flex-col gap-1 transition-colors ${
											c.profitable
												? isBest
													? "border-green-600 bg-green-100/70 dark:bg-green-950"
													: "border-green-400 bg-green-50/60 dark:bg-green-950/40"
												: "border-[rgb(var(--border))] bg-[rgba(var(--surface),0.65)] dark:border-gray-700 dark:bg-neutral-800"
										}`}
									>
										<div className="flex flex-wrap items-center justify-between gap-2">
											<span className="font-medium">{c.selection}</span>
											{c.profitable && (
												<span
													className={`text-xs font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
														isBest
															? "bg-green-600 text-white"
															: "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100"
													}`}
												>
													✅ {isBest ? "Best Surebet" : "Profitable"}
												</span>
											)}
										</div>
										<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
											<span>Odds: {c.odds.odd1.toFixed(2)} & + {c.odds.odd2.toFixed(2)}</span>
											<span>Arb %: {c.arbitragePercentage.toFixed(4)}</span>
											{c.profitable && <span>ROI: {c.roi.toFixed(2)}%</span>}
										</div>
											{c.profitable && (
												<div className="mt-2 space-y-2 text-xs">
													<div className="grid sm:grid-cols-2 gap-2">
														<div className="space-y-0.5">
															<p className="font-medium">Stake 1</p>
															<p>{formatCurrency(c.stake1)}</p>
															<p className="text-[10px] text-gray-600 dark:text-gray-400">{c.stake1.toFixed(2)} × {c.odds.odd1.toFixed(2)} = {formatCurrency(c.returns.ret1)}</p>
														</div>
														<div className="space-y-0.5">
															<p className="font-medium">Stake 2</p>
															<p>{formatCurrency(c.stake2)}</p>
															<p className="text-[10px] text-gray-600 dark:text-gray-400">{c.stake2.toFixed(2)} × {c.odds.odd2.toFixed(2)} = {formatCurrency(c.returns.ret2)}</p>
														</div>
														<div className="space-y-0.5">
															<p className="font-medium">Guaranteed Profit</p>
															<p>{formatCurrency(c.profit)}</p>
															<p className="text-[10px] text-gray-600 dark:text-gray-400">Guaranteed Payout: {formatCurrency(Math.min(c.returns.ret1, c.returns.ret2))}</p>
														</div>
													</div>
												</div>
											)}
										{!c.profitable && (
											<p className="text-xs text-gray-500 mt-1">Not profitable</p>
										)}
									</div>
								);
							})}
							{!hasProfitable && combinations.length > 0 && (
								<div className="p-3 rounded-md bg-gray-100 dark:bg-neutral-800 text-xs text-gray-600 dark:text-gray-300 border border-dashed">
									No profitable arbitrage opportunity found.
								</div>
							)}
						</CardContent>
				</Card>

				<Card className="order-1 md:order-2 sticky top-4 h-fit">
					<CardHeader>
						<CardTitle>Best Combination</CardTitle>
					</CardHeader>
					<CardContent>
						{best ? (
							<div className="space-y-4 text-sm">
								<div>
									<p className="font-medium">{best.selection}</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">Arbitrage %: {best.arbitragePercentage.toFixed(4)}</p>
								</div>
								<div className="grid grid-cols-2 gap-4 text-xs">
									<div className="space-y-0.5">
										<p className="font-semibold">Stake 1</p>
										<p>{formatCurrency(best.stake1)}</p>
										<p className="text-[10px] text-gray-600 dark:text-gray-400">{best.stake1.toFixed(2)} × {best.odds.odd1.toFixed(2)} = {formatCurrency(best.returns.ret1)}</p>
									</div>
									<div className="space-y-0.5">
										<p className="font-semibold">Stake 2</p>
										<p>{formatCurrency(best.stake2)}</p>
										<p className="text-[10px] text-gray-600 dark:text-gray-400">{best.stake2.toFixed(2)} × {best.odds.odd2.toFixed(2)} = {formatCurrency(best.returns.ret2)}</p>
									</div>
									<div className="space-y-0.5">
										<p className="font-semibold">Guaranteed Payout</p>
										<p>{formatCurrency(Math.min(best.returns.ret1, best.returns.ret2))}</p>
										<p className="text-[10px] text-gray-600 dark:text-gray-400">Profit = Payout - Stake</p>
									</div>
									<div className="space-y-0.5">
										<p className="font-semibold">Profit / ROI</p>
										<p className="text-green-600 dark:text-green-400">{formatCurrency(best.profit)}</p>
										<p className="text-[10px] text-gray-600 dark:text-gray-400">ROI {best.roi.toFixed(2)}%</p>
									</div>
								</div>
								<p className="text-xs text-gray-500">Updated: {new Date(state.lastUpdated).toLocaleTimeString()}</p>
							</div>
						) : (
							<p className="text-sm text-gray-500">No sure-win combinations available right now.</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ArbitrageCalculator;
