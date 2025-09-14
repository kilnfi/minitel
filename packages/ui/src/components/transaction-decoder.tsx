import JsonView from "@uiw/react-json-view";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";
import { vscodeTheme } from "@uiw/react-json-view/vscode";
import {
	CopyIcon,
	DownloadIcon,
	TriangleAlertIcon,
	ZapIcon,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { CopyButton, CopyButtonIcon } from "#/components/CopyButton";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Label } from "#/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Textarea } from "#/components/ui/textarea";

export interface TransactionDecoderProps<T = unknown> {
	title?: string;
	subtitle?: string;
	rawTransaction: string;
	onRawTransactionChange: (value: string) => void;
	onDecode: () => void;
	decodedTransaction: T | null;
	hash?: string;
	sampleTransaction?: string;
	warnings?: Array<{ message: string }>;
	renderSummary?: (data: T) => React.ReactNode;
	placeholder?: string;
}

export function TransactionDecoder<T = unknown>({
	title = "Transaction decoder",
	subtitle = "Decode and analyze blockchain transactions",
	rawTransaction,
	onRawTransactionChange,
	onDecode,
	decodedTransaction,
	hash,
	sampleTransaction,
	warnings = [],
	renderSummary,
	placeholder = "Paste your transaction as hex or JSON",
}: TransactionDecoderProps<T>) {
	const textareaId = useId();
	const warningsAmount = warnings.length;
	const [isDarkMode, setIsDarkMode] = useState(
		window.matchMedia("(prefers-color-scheme: dark)").matches,
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			setIsDarkMode(e.matches);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	return (
		<div className="flex flex-col items-center gap-y-14 py-14 min-h-screen">
			<div className="gap-4 flex flex-col items-center justify-center">
				<h1 className="text-5xl font-extrabold">{title}</h1>
				<p>{subtitle}</p>
			</div>
			<div className="flex flex-col gap-4 w-full max-w-3xl">
				<Card>
					<CardContent className="flex flex-col gap-4">
						<div className="flex items-center justify-between">
							<span className="text-xl font-semibold">
								Paste your transaction
							</span>
							{sampleTransaction && (
								<Button
									variant="outline"
									onClick={() => onRawTransactionChange(sampleTransaction)}
								>
									Try sample
								</Button>
							)}
						</div>
						<div className="grid w-full gap-3">
							<Label htmlFor="transaction">Raw transaction</Label>
							<Textarea
								className="h-48 resize-y"
								placeholder={placeholder}
								id={textareaId}
								value={rawTransaction}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									onRawTransactionChange(e.target.value)
								}
							/>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex flex-col gap-4">
						<span className="text-xl font-semibold">Run decoder</span>
						<Button className="w-full" size="sm" onClick={onDecode}>
							<ZapIcon /> Run
						</Button>
					</CardContent>
				</Card>
				{hash && (
					<Card>
						<CardContent className="flex flex-col gap-4">
							<span className="text-xl font-semibold">Hash</span>
							<pre className="relative bg-secondary rounded-md px-4 py-3.5 font-mono text-sm overflow-x-auto">
								<code>{hash}</code>
								<CopyButtonIcon
									wrapperClassName="absolute right-4 top-1/2 -translate-y-1/2"
									textToCopy={hash}
									disabled={!hash}
								/>
							</pre>
						</CardContent>
					</Card>
				)}
				<Card>
					<CardContent className="flex flex-col gap-4">
						<span className="text-xl font-semibold">Output</span>
						{warningsAmount > 0 && (
							<Alert variant="warning">
								<TriangleAlertIcon />
								<AlertTitle>Important notice.</AlertTitle>
								<AlertDescription>
									<p>
										This operation includes {warningsAmount} alert
										{warningsAmount > 1 ? "s" : ""}. Please review details below
										before continuing.
									</p>
									<ul className="list-inside list-disc text-sm">
										{warnings.map((warning, index) => (
											<li key={index}>{warning.message}</li>
										))}
									</ul>
								</AlertDescription>
							</Alert>
						)}
						<div className="w-full">
							<Tabs
								className="w-full gap-6"
								defaultValue={renderSummary ? "summary" : "json"}
							>
								<TabsList className="w-full">
									{renderSummary && (
										<TabsTrigger value="summary">Summary</TabsTrigger>
									)}
									<TabsTrigger value="json">JSON</TabsTrigger>
								</TabsList>
								{renderSummary && (
									<TabsContent className="space-y-6" value="summary">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">
												Decoded transaction data
											</span>
											<div className="flex items-center gap-2">
												<CopyButton
													disabled={!decodedTransaction}
													textToCopy={JSON.stringify(decodedTransaction)}
												>
													Copy JSON
												</CopyButton>
												<Button
													disabled={!decodedTransaction}
													size="sm"
													variant="outline"
													onClick={() => {
														const blob = new Blob(
															[JSON.stringify(decodedTransaction)],
															{
																type: "application/json",
															},
														);
														const url = URL.createObjectURL(blob);
														const a = document.createElement("a");
														a.href = url;
														a.download = "transaction.json";
														a.click();
													}}
												>
													<DownloadIcon />
													Download
												</Button>
											</div>
										</div>
										<div className="space-y-3">
											{decodedTransaction && renderSummary(decodedTransaction)}
										</div>
									</TabsContent>
								)}
								<TabsContent value="json">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">
											Decoded transaction data
										</span>
										<div className="flex items-center gap-2">
											<CopyButton
												disabled={!decodedTransaction}
												textToCopy={JSON.stringify(decodedTransaction)}
											>
												Copy JSON
											</CopyButton>
											<Button
												size="sm"
												variant="outline"
												disabled={!decodedTransaction}
												onClick={() => {
													const blob = new Blob(
														[JSON.stringify(decodedTransaction)],
														{
															type: "application/json",
														},
													);
													const url = URL.createObjectURL(blob);
													const a = document.createElement("a");
													a.href = url;
													a.download = "transaction.json";
													a.click();
												}}
											>
												<DownloadIcon />
												Download
											</Button>
										</div>
									</div>
									<JsonView
										value={decodedTransaction ?? {}}
										style={isDarkMode ? vscodeTheme : githubLightTheme}
									/>
								</TabsContent>
							</Tabs>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
