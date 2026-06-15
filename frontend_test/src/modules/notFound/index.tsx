import { Button, Result } from 'antd'

export const NotFound = () => (
  <Result
    status="404"
    title="404"
    subTitle="LA PAGINA SOLICITADA NO EXISTE."
    extra={<Button type="primary">Back Home</Button>}
  />
)
