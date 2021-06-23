import * as Sentry from '@sentry/node'

import { deleteRooms } from '../gql/mutations'
import { getRecentlyCreatedRooms } from '../gql/queries'
import orm from './orm'

const cron = require('node-cron')
