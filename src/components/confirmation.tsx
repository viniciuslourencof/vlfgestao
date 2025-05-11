import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  
  type Props = {
    open: boolean
    onCancel: () => void
    onConfirm: () => void
  }
  
  export function Confirmation({ open, onCancel, onConfirm }: Props) {
    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação é irreversível
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" onClick={onCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer" onClick={onConfirm}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  