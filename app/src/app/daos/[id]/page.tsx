import { DAOInfo } from "@/components/dao/DAOInfo";
import { FundingHistory } from "@/components/dao/FundingHistory";
import { Programs } from "@/components/dao/Programs";
import { Proposals } from "@/components/dao/Proposals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import connectToDatabase from "@/database/connect";
import DAO from "@/database/models/dao";
import mongoose from "mongoose";
import { notFound } from "next/navigation";

type Params = {
  params: { id: string };
};

async function getDaoDetail(id: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const dao = await DAO.findById(id).lean();
  return dao;
}
export default async function DaoDetailPage({ params }: Params) {
  params = await params;
  const dao: any = await getDaoDetail(params.id);

  if (!dao) return notFound();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 h-full">
      {/* Left: DAO Info */}
      <DAOInfo dao={{ ...dao, _id: dao._id.toString() }} />

      <Tabs defaultValue="proposals" className="md:col-span-2">
        <TabsList className="grid w-full grid-cols-3 space-x-1">
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="funding">Funding History</TabsTrigger>
        </TabsList>
        <TabsContent value="proposals">
          <Proposals dao_id={params.id} treasury_address={dao.treasury_address} dao_address={dao.dao_address} />

        </TabsContent>

        <TabsContent value="programs">
          <Programs dao_id={params.id} treasury_address={dao.treasury_address} dao_address={dao.dao_address} />
        </TabsContent>
        <TabsContent value="funding">
          <FundingHistory dao_id={params.id} treasury_address={dao.treasury_address} dao_address={dao.dao_address} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
