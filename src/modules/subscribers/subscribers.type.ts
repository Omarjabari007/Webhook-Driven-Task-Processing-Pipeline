export interface CreateSubscriberDTO{
    url: string;
}

export interface SubscriberResponse {
    id: string;
    pipelineId: string;
    url: string;
    createdAt: Date;
}