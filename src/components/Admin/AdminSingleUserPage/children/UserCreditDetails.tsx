import { useState } from "react";
import { v4 } from "uuid";
import { z } from "zod";
import CentralLoader from "~/components/Shared/CentralLoader";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import useJsonData from "~/hooks/useJsonData";
import { CreditDetails } from "~/lib/typesJsonData";
const initialFreeCreditBalance = 10;

const creditSchema = z.object({
  balance: z
    .string()
    .transform((val) => (val.trim() === "" ? "0" : val)) // Convert empty string to "0"
    .refine((val) => /^\d+$/.test(val), {
      message: "Balance must be an integer",
    })
    .transform((val) => Number(val)), // Convert validated string to number
});

interface UserCreditDetailsProps {
  userEmail: string;
}
const UserCreditDetails: React.FC<UserCreditDetailsProps> = ({ userEmail }) => {
  const [creditDetails, setCreditDetails] = useJsonData<CreditDetails>(
    `admin/public/creditDetails/${userEmail}`,
    {
      id: v4(),
      balance: initialFreeCreditBalance,
      userEmail: userEmail,
    }
  );

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!creditDetails) return;
    const value = e.target.value;

    // Validate using Zod
    const result = creditSchema.safeParse({ balance: value });

    if (result.success) {
      setCreditDetails({ ...creditDetails, balance: result.data.balance }); // Valid data is set
      setError(""); // Clear error message
    } else {
      setError(result.error.errors[0].message); // Show first error message
    }
  };
  if (!creditDetails) {
    return <CentralLoader />;
  }
  return (
    <div>
      <div className="space-y-2">
        <Label>Credits</Label>
        <Input
          value={creditDetails.balance === 0 ? "" : creditDetails.balance}
          onChange={handleChange}
        />
      </div>
      <div className="h-[10px]"></div>
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default UserCreditDetails;
