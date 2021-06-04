export type GraphQlResponse<Data = unknown> = {
  data: Data
  errors: {
    message: string
  }[]
}
