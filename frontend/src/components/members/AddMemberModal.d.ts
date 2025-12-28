import { Member } from '../../api/members';
interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (member: Member) => void;
}
export declare function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=AddMemberModal.d.ts.map