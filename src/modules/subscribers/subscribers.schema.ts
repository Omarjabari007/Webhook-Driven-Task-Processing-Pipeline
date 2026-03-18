import {z} from "zod"

export const SubscriberCreationSchema = z.object({
    params: z.object({
        pipelineId: z.string().uuid()
    }),
    body: z.object({
        url: z.string().url()
    })
});

export const subscriberIdSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
})

export const pipelineIdSchema = z.object({
    params: z.object({
        pipelineId: z.string().uuid()
    })
});