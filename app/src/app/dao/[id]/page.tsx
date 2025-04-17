import { Proposals } from "@/components/dao/Proposals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

// Mock proposals
const mockProposals = [
  { id: "1", title: "Add new member", status: "Passed", createdAt: "2025-04-10" },
  { id: "2", title: "Fund project X", status: "Pending", createdAt: "2025-04-12" },
  { id: "3", title: "Remove inactive wallet", status: "Rejected", createdAt: "2025-04-13" },
];

export default async function DaoDetailPage({ params }: Params) {
  params = await params;
  const dao: any = await getDaoDetail(params.id);

  if (!dao) return notFound();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Left: DAO Info */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{dao.params.daoName}</CardTitle>
          <CardDescription>{dao.params.daoDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p><strong>Description:</strong> </p>
          <p><strong>X:</strong> {dao.params.daoXAccount}</p>
          <p><strong>Discord:</strong> {dao.params.daoDiscordAccount}</p>
          <p className="break-all"><strong>Contract:</strong> {dao.dao_address}</p>
          <p className="break-all"><strong>Treasury:</strong> {dao.treasury_address}</p>
        </CardContent>
      </Card>
      <Proposals dao_id={(await params).id} treasury_address={dao.treasury_address} dao_address={dao.dao_address} />
    </div>
  );
}
