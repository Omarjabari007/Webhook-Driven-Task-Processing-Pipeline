import {z} from "zod"

export const PipelineCreationSchema = z.object({
    body: z.object({
    name: z.string().min(3),
    sourcePath: z.string().min(1),
    actionType: z.enum(["aoe4_match_summary","aoe4_player_profile"]),
    config: z.object({
        apiUrl: z.string().url()
    }).optional() 
})
})

export const pipelineIdSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
})