import { Drawer, Modal, type DrawerProps, type ModalProps } from '@mantine/core'
import { cn } from '../utils/cn'

export type DesignModalProps = ModalProps
export type DesignDrawerProps = DrawerProps

export function DesignModal({ className, radius = 'sm', ...props }: DesignModalProps): JSX.Element {
  const rootClassName = cn('tc-design-modal', 'font-nomi-sans text-nomi-ink', className)

  return <Modal {...props} className={rootClassName} radius={radius} />
}

export function DesignDrawer({ className, ...props }: DesignDrawerProps): JSX.Element {
  const rootClassName = cn('tc-design-drawer', 'font-nomi-sans text-nomi-ink', className)

  return <Drawer {...props} className={rootClassName} />
}
