import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModalAvisoProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  mensagem: string;
};

export default function ModalAviso({ open, onClose, mensagem }: ModalAvisoProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aviso</DialogTitle>
        </DialogHeader>
        <p>{mensagem}</p>
      </DialogContent>
    </Dialog>
  );
}
