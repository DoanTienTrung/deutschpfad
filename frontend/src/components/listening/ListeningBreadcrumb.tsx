import { Breadcrumb, type Crumb } from '@kit'

export default function ListeningBreadcrumb({ items }: { items: Crumb[] }) {
  return <Breadcrumb items={items} />
}
