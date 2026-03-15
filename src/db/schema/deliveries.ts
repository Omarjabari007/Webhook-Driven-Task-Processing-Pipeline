import {pgTable , uuid , timestamp , integer , text} from "drizzle-orm/pg-core"
import {jobs} from "./index.ts"
import {subscribers} from "./index.ts"
import { deliveryStatus } from "./statusEnum.ts"

