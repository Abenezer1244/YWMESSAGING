import { Branch } from '../../stores/branchStore';
interface BranchFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (branch: Branch) => void;
    churchId: string;
    branch?: Branch;
}
export declare function BranchFormModal({ isOpen, onClose, onSuccess, churchId, branch, }: BranchFormModalProps): import("react/jsx-runtime").JSX.Element | null;
export default BranchFormModal;
//# sourceMappingURL=BranchFormModal.d.ts.map