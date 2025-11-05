import { Group } from '../../stores/groupStore';
interface GroupFormModalProps {
    isOpen: boolean;
    group?: Group;
    branchId: string;
    onClose: () => void;
    onSuccess: (group: Group) => void;
}
export declare function GroupFormModal({ isOpen, group, branchId, onClose, onSuccess }: GroupFormModalProps): any;
export {};
//# sourceMappingURL=GroupFormModal.d.ts.map