import { useCallback } from 'react';
import type ReactEChartsCore from 'echarts-for-react/esm/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface UseChartExportOptions {
    chartRef: React.RefObject<ReactEChartsCore | null>;
    title: string;
    dataTableRef?: React.RefObject<HTMLDivElement | null>;
    showTable?: boolean;
}

export function useChartExport({ chartRef, title, dataTableRef, showTable }: UseChartExportOptions) {
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
            scale: 1.5,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'a4', true);
        pdf.addImage(imgData, 'JPEG', 0, 10, imgWidth, imgHeight);

        if (showTable && dataTableRef?.current) {
            const tableEl = dataTableRef.current;
            const scrollContainer = tableEl.querySelector<HTMLElement>('[class*="max-h-96"]');
            let savedScrollStyle = '';
            if (scrollContainer) {
                savedScrollStyle = scrollContainer.style.cssText;
                scrollContainer.style.maxHeight = 'none';
                scrollContainer.style.overflow = 'visible';
            }

            const tableCanvas = await html2canvas(tableEl, {
                backgroundColor: '#ffffff',
                scale: 1.5,
            });

            if (scrollContainer) {
                scrollContainer.style.cssText = savedScrollStyle;
            }

            const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.8);
            const tableImgWidth = 190;
            const tableImgHeight =
                (tableCanvas.height * tableImgWidth) / tableCanvas.width;

            const PAGE_HEIGHT = 297;
            const BOTTOM_MARGIN = 10;
            const MAX_Y = PAGE_HEIGHT - BOTTOM_MARGIN;
            let tableY = 10 + imgHeight + 5;

            if (tableY + tableImgHeight > MAX_Y) {
                pdf.addPage();
                tableY = 10;
            }

            pdf.addImage(
                tableImgData,
                'JPEG',
                10,
                tableY,
                tableImgWidth,
                tableImgHeight,
            );
        }

        pdf.save(`${sanitiseFilename(title)}.pdf`);
    }, [chartRef, title, dataTableRef, showTable]);

    return { exportJpg, exportPdf };
}
