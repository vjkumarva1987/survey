import { AddWebhookButton } from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/AddWebhookButton";
import { WebhookRowData } from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookRowData";
import { WebhookTable } from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookTable";
import { WebhookTableHeading } from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookTableHeading";
import { getTranslations } from "next-intl/server";
import { getEnvironment } from "@formbricks/lib/environment/service";
import { getSurveys } from "@formbricks/lib/survey/service";
import { findMatchingLocale } from "@formbricks/lib/utils/locale";
import { getWebhooks } from "@formbricks/lib/webhook/service";
import { GoBackButton } from "@formbricks/ui/components/GoBackButton";
import { PageContentWrapper } from "@formbricks/ui/components/PageContentWrapper";
import { PageHeader } from "@formbricks/ui/components/PageHeader";

const Page = async ({ params }) => {
  const t = await getTranslations();
  const [webhooksUnsorted, surveys, environment] = await Promise.all([
    getWebhooks(params.environmentId),
    getSurveys(params.environmentId, 200), // HOTFIX: not getting all surveys for now since it's maxing out the prisma accelerate limit
    getEnvironment(params.environmentId),
  ]);

  if (!environment) {
    throw new Error(t("common.environment_not_found"));
  }

  const webhooks = webhooksUnsorted.sort((a, b) => {
    if (a.createdAt > b.createdAt) return -1;
    if (a.createdAt < b.createdAt) return 1;
    return 0;
  });

  const renderAddWebhookButton = () => <AddWebhookButton environment={environment} surveys={surveys} />;
  const locale = await findMatchingLocale();

  return (
    <PageContentWrapper>
      <GoBackButton />
      <PageHeader pageTitle={t("common.webhooks")} cta={renderAddWebhookButton()} />
      <WebhookTable environment={environment} webhooks={webhooks} surveys={surveys}>
        <WebhookTableHeading />
        {webhooks.map((webhook) => (
          <WebhookRowData key={webhook.id} webhook={webhook} surveys={surveys} locale={locale} />
        ))}
      </WebhookTable>
    </PageContentWrapper>
  );
};

export default Page;
