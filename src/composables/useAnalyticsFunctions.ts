import { ref } from 'vue'
import axios, { AxiosProgressEvent } from 'axios'
import { useErrorHandler } from "@/composables/useErrorHandler";
import { useSuccessHandler } from "@/composables/useSuccessHandler";

/**
 * Типы ответов (упрощённо, расширяй по необходимости)
 */
interface SeriesItem {
    date: string;
    quantity: number;
    sum: number;
}

interface SummaryResponse {
    total_quantity: number;
    total_sum: number;
    series: SeriesItem[];
}

interface ProductsIncomeResponse {
    total_profit: number;
    total_revenue: number;
    total_cost: number;
}

interface CombinedAnalyticsResponse {
    success: boolean;
    sales_summary?: SummaryResponse;
    orders_summary?: SummaryResponse;
    products_summary?: ProductsIncomeResponse;
}

interface WeeklyAmountWeek {
    start_date: string;
    end_date: string;
    total_by_status: Record<string, number>;
}

interface WeeklyAmountResponse {
    success: boolean;
    from: string;
    to: string;
    filters: Record<string, any>;
    weeks: WeeklyAmountWeek[] | any;
}

export function useAnalyticsFunctions() {
    const sending = ref(false)
    const progress = ref(0)

    // Вспомогательная внутренняя функция для GET с прогрессом
    const getWithProgress = async (url: string, params: Record<string, any> = {}) => {
        if (sending.value) return
        sending.value = true
        progress.value = 0

        try {
            const res = await axios.get(url, {
                params,
                onDownloadProgress: (event: AxiosProgressEvent) => {
                    if (event.total && event.loaded != null) {
                        progress.value = Math.round((event.loaded * 100) / event.total)
                    }
                }
            })

            // useSuccessHandler().showSuccess(res)
            return res.data
        } catch (e) {
            useErrorHandler().showError(e)
            // возвращаем undefined явно
            return undefined
        } finally {
            sending.value = false
        }
    }

    /**
     * Получить финансовую сводку по продажам (sales/plotseries)
     * params: { from?: string, to?: string, interval?: 'hour'|'day'|'month' }
     */
    const getFinancialSummarySales = async (params: {
        from?: string,
        to?: string,
        interval?: 'hour' | 'day' | 'month',
        // любые дополнительные параметры
        [k: string]: any
    } = {}): Promise<SummaryResponse | undefined> => {
        return await getWithProgress('analytics/financial-summary-sales', params) as SummaryResponse | undefined
    }

    /**
     * Получить финансовую сводку по заказам (orders/plotseries)
     */
    const getFinancialSummaryOrders = async (params: {
        from?: string,
        to?: string,
        interval?: 'hour' | 'day' | 'month',
        [k: string]: any
    } = {}): Promise<SummaryResponse | undefined> => {
        return await getWithProgress('analytics/financial-summary-orders', params) as SummaryResponse | undefined
    }

    /**
     * Combined analytics: объединённый отчёт
     */
    const getCombinedAnalytics = async (params: {
        from?: string,
        to?: string,
        interval?: 'hour' | 'day' | 'month',
        [k: string]: any
    } = {}): Promise<CombinedAnalyticsResponse | undefined> => {
        return await getWithProgress('analytics/combined/analytics', params) as CombinedAnalyticsResponse | undefined
    }

    /**
     * Discounts analytics (index). Передавай флаги в params:
     * get_discounts, get_coupons, get_clients, get_categories (boolean)
     */
    const getDiscountsAnalytics = async (params: {
        get_discounts?: boolean,
        get_coupons?: boolean,
        get_clients?: boolean,
        get_categories?: boolean,
        per_page?: number,
        page?: number,
        [k: string]: any
    } = {}): Promise<any> => {
        return await getWithProgress('analytics/discounts/analytics', params)
    }

    /**
     * Report dashboard
     */
    const getReportDashboard = async (params: { [k: string]: any } = {}): Promise<any> => {
        return await getWithProgress('analytics/report/dashboard', params)
    }

    /**
     * Income by products
     */
    const getProductsIncome = async (params: {
        from?: string,
        to?: string,
        limit?: number,
        offset?: number,
        [k: string]: any
    } = {}): Promise<ProductsIncomeResponse | undefined> => {
        return await getWithProgress('analytics/products/income', params) as ProductsIncomeResponse | undefined
    }

    /**
     * Weekly amount (chart)
     * params: from, to, client_id
     */
    const getWeeklyAmount = async (params: {
        from?: string,
        to?: string,
        client_id?: number | string,
        [k: string]: any
    } = {}): Promise<WeeklyAmountResponse | undefined> => {
        return await getWithProgress('analytics/chart', params) as WeeklyAmountResponse | undefined
    }

    return {
        sending,
        progress,
        getFinancialSummarySales,
        getFinancialSummaryOrders,
        getCombinedAnalytics,
        getDiscountsAnalytics,
        getReportDashboard,
        getProductsIncome,
        getWeeklyAmount,
    }
}
