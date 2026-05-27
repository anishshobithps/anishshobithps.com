import {
  BookOpenIcon,
  ChatCircleIcon,
  EyeIcon,
  GearIcon,
  HeartIcon,
} from "@/components/shared/icons";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
  TypographySmall,
  Text,
} from "@/components/ui/typography";
import { getAdminStats } from "@/app/admin/actions";

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-5">
      <div className="flex items-center justify-between">
        <TypographySmall className="text-muted-foreground">
          {label}
        </TypographySmall>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <Text as="p" className="text-3xl font-bold tabular-nums">
        {value.toLocaleString()}
      </Text>
      {sub && <TypographyMuted className="text-xs">{sub}</TypographyMuted>}
    </div>
  );
}

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-8 p-6">
        <div>
          <TypographyH1>Admin</TypographyH1>
          <TypographyLead>Site overview and content management.</TypographyLead>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Guestbook entries"
            value={stats.guestbook.active}
            sub={`${stats.guestbook.total} total (incl. deleted)`}
            icon={<ChatCircleIcon className="size-4" weight="duotone" />}
          />
          <StatCard
            label="Blog comments"
            value={stats.comments.active}
            sub={`${stats.comments.total} total (incl. deleted)`}
            icon={<BookOpenIcon className="size-4" weight="duotone" />}
          />
          <StatCard
            label="Blog reads"
            value={stats.reads}
            sub="unique IP × post pairs"
            icon={<EyeIcon className="size-4" weight="duotone" />}
          />
          <StatCard
            label="Blog reactions"
            value={stats.reactions}
            sub="unique IP × post pairs"
            icon={<HeartIcon className="size-4" weight="duotone" />}
          />
        </div>
      </div>
    </div>
  );
}
