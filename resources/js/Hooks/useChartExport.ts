import { useCallback } from 'react';
import type ReactEChartsCore from 'echarts-for-react/esm/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface UseChartExportOptions {
    chartRef: React.RefObject<ReactEChartsCore | null>;
    title: string;
    dataTableRef?: React.RefObject<HTMLDivElement | null>;
}

export function useChartExport({ chartRef, title, dataTableRef }: UseChartExportOptions) {
    const sanitiseFilename = (name: string) =>
        name.replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_') || 'chart';

    const exportJpg = useCallback(() => {
        const instance = chartRef.current?.getEchartsInstance();
        if (!instance) return;
        const url = instance.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#fff',
        });
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sanitiseFilename(title)}.jpg`;
        link.click();
    }, [chartRef, title]);

    const exportPdf = useCallback(async () => {
        const instance = chartRef.current?.getEchartsInstance();
        if (!instance) return;
        const dom = instance.getDom();
        if (!dom) return;

        const canvas = await html2canvas(dom, {
            backgroundColor: '#ffffff',
            scale: 2,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);

        if (dataTableRef?.current) {
            const tableCanvas = await html2canvas(dataTableRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
            });
            const tableImgData = tableCanvas.toDataURL('image/png');
            const tableImgWidth = 190;
            const tableImgHeight =
                (tableCanvas.height * tableImgWidth) / tableCanvas.width;
            const tableY = 10 + imgHeight + 5;
            pdf.addImage(
                tableImgData,
                'PNG',
                10,
                tableY,
                tableImgWidth,
                tableImgHeight,
            );
        }

        pdf.save(`${sanitiseFilename(title)}.pdf`);
    }, [chartRef, title, dataTableRef]);

    return { exportJpg, exportPdf };
}
