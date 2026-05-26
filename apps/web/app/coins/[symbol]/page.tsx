import { CoinDetailTemplate } from "@/components/templates/CoinDetailTemplate";

interface Params {
  symbol: string;
}

export default async function CoinDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { symbol } = await params;
  return <CoinDetailTemplate symbol={symbol} />;
}
