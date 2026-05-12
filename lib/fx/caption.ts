function formatDateLabel(dateLabel: string) {
    const [month, day, year] = dateLabel.split("/");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
    );

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export function generateCaption(dateLabel: string) {
    const formattedDate = formatDateLabel(dateLabel);

    return `Top 3 Currency Movers Today | ${formattedDate}

Exchange rates move daily. For updated buying and selling rates in Davao City, message ALSHIZAMIN Money Changer today.

Market reference only. Actual buying and selling rates may vary depending on availability and transaction time.

📍 ALSHIZAMIN Money Changer
City Triangle, Davao City
Front of Philippine Red Cross Building
Beside Davao Post Office

📞 0916 904 6899
📞 0993 957 7505

💬 Message us for today’s exchange rates.

#ALSHIZAMIN #MoneyChangerDavao #CurrencyExchangeDavao #DavaoMoneyChanger #ForeignExchangeDavao #PHPExchangeRate #DavaoCity #DavaoBusiness`;
}