import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Bitcoin, Activity } from "lucide-react";

async function getCryptoPrices() {
  try {
    const [cgRes, wallexRes] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd", { next: { revalidate: 300 } }),
      fetch("https://api.wallex.ir/v1/markets", { next: { revalidate: 300 } })
    ]);
    
    const cgData = cgRes.ok ? await cgRes.json() : null;
    const wallexData = wallexRes.ok ? await wallexRes.json() : null;

    return { cgData, wallexData };
  } catch (error) {
    console.error("Crypto API error:", error);
    return { cgData: null, wallexData: null };
  }
}

export default async function CryptoWidget() {
  const { cgData, wallexData } = await getCryptoPrices();

  const btcPrice = cgData?.bitcoin?.usd ? `$${cgData.bitcoin.usd.toLocaleString()}` : "N/A";
  const ethPrice = cgData?.ethereum?.usd ? `$${cgData.ethereum.usd.toLocaleString()}` : "N/A";
  
  let usdtPriceToman = "N/A";
  if (wallexData?.result?.symbols?.USDTTMN?.stats?.lastPrice) {
    const priceNumber = parseFloat(wallexData.result.symbols.USDTTMN.stats.lastPrice);
    usdtPriceToman = `${priceNumber.toLocaleString("fa-IR")} تومان`;
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 border-none shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex justify-between items-center">
          Crypto Markets
          <TrendingUp className="h-4 w-4 text-indigo-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-sm">Bitcoin</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100">{btcPrice}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-sm">Ethereum</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100">{ethPrice}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                T
              </div>
              <span className="font-semibold text-sm">Tether (USDT)</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100" dir="rtl">{usdtPriceToman}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
