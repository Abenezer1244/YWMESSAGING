import { Member } from '../../api/members';
interface AddMemberModalProps {
    isOpen: boolean;
    groupId: string;
    onClose: () => void;
    onSuccess: (member: Member) => void;
}
export declare function AddMemberModal({ isOpen, groupId, onClose, onSuccess }: AddMemberModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=AddMemberModal.d.ts.map