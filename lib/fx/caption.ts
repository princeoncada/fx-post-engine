import { formatPhtDate } from "./pht-date";

export function generateCaption(latestMarketDate: string, retrievedDate: string) {
    const formattedMarketDate = formatPhtDate(latestMarketDate, "long");
    const formattedRetrievedDate = formatPhtDate(retrievedDate, "long");

    return `Top 3 Currency Movers | Retrieved on ${formattedRetrievedDate} (PHT)

Latest Market Data: ${formattedMarketDate}.

Exchange rates move daily. For updated buying and selling rates in Davao City, message ALSHIZAMIN Money Changer today.

Market reference only. Actual buying and selling rates may vary depending on availability and transaction time.

📍 ALSHIZAMIN Money Changer
City Triangle, Davao City
Front of Philippine Red Cross Building
Beside Davao Post Office

☎️ 0916 904 6899
☎️ 0993 957 7505

💬 Message us for today's exchange rates.

#ALSHIZAMIN #MoneyChangerDavao #CurrencyExchangeDavao #DavaoMoneyChanger #ForeignExchangeDavao #PHPExchangeRate #DavaoCity #DavaoBusiness`;
}
