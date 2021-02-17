export interface SharedBpmnResponse {
  data: {
    share: {
      id: string
      diagram: {
        name: string
        content: string
      }
    }
  }
}
