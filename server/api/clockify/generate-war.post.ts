import XLSPrinter from "~/server/utils/XlsPrinter";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const reportItems: any[] = [];
    // console.log('body.accomplishmentReports : ', body.accomplishmentReports);
    body.accomplishmentReports?.map((item: any) =>
        reportItems.push({
            "columns": Object.entries(item)
                .filter(([key, _]) => {
                    if (['day', 'empty'].includes(item.status)) {
                        return key !== 'status' && key !== 'totalDurationPerDay' && key !== 'formattedDuration';
                    } else {
                        return key !== 'status' && key !== 'duration';
                    }
                })
                .map(([_, value]) => value)
        })
    );

    // console.log('reportItems :>> ', reportItems);
    const excelData = {...body, war: reportItems};

    const warResult = await XLSPrinter.print("/war-template.xlsx", excelData)

    return warResult;
});
