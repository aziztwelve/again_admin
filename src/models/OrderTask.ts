class OrderTask {
    id: number | null = null;
    title: string | null = null;
    description: string | null = null;
    created_at: string | null = null;
    due_date: string | null = null;
    estimated_time: number | null = null;

    assignee: {
        id: number | null;
        name: string | null;
        email: string | null;
    } | null = {
        id: null,
        name: null,
        email: null
    };

    creator: {
        id: number | null;
        name: string | null;
        email: string | null;
    } | null = {
        id: null,
        name: null,
        email: null
    };

    priority: {
        id: number | null;
        name: string | null;
        slug: string | null;
        color: string | null;
        level: number | null;
        created_at: string | null;
        updated_at: string | null;
    } | null = {
        id: null,
        name: null,
        slug: null,
        color: null,
        level: null,
        created_at: null,
        updated_at: null
    };

    status: {
        id: number | null;
        name: string | null;
        slug: string | null;
        color: string | null;
        order: number | null;
        is_default: boolean | null;
        created_at: string | null;
        updated_at: string | null;
    } | null = {
        id: null,
        name: null,
        slug: null,
        color: null,
        order: null,
        is_default: null,
        created_at: null,
        updated_at: null
    };

    labels: Array<{
        id: number | null;
        name: string | null;
        slug: string | null;
        color: string | null;
        created_at: string | null;
        updated_at: string | null;
        pivot: {
            task_id: number | null;
            label_id: number | null;
        } | null;
    }> | null = [];

    comments: any[] | null = [];

    constructor(init?: Partial<OrderTask>) {
        Object.assign(this, init);
    }
}

export default OrderTask;