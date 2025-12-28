-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_groupId_fkey";
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_memberId_fkey";
ALTER TABLE "Group" DROP CONSTRAINT "Group_branchId_fkey";
ALTER TABLE "Group" DROP CONSTRAINT "Group_churchId_fkey";

-- DropTable
DROP TABLE "GroupMember";
DROP TABLE "Group";
