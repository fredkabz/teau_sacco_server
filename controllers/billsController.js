const {
  insert_bill,
  pay_bill,
  update_bill,
  delete_bill,
  pay_bills_report,
  bills_by_status,
  bills_by_params,
  supplier_bills,
  uncleared,
  bill_details,
  bill_items,
  approve_bill,
} = require("../util/bills");

const conn = require("../util/database2");

const all_bills_get = async (req, res) => {
    try {
        const bills = await bills_by_status("all", null);
        return res.status(200).json({ message: "success", data: bills })
    } catch (error) {
      return  res.status(400).json({message:"error",data:error})
    }
    

}

const bill_details_get = async(req, res) => {
    const bill_id = req.params.id;
     try {
        const bills = await bill_details(bill_id);
        return res.status(200).json({ message: "success", data: bills })
    } catch (error) {
      return  res.status(400).json({message:"error",data:error})
    }
}
const bill_items_get = async (req, res) => {
  const bill_id = req.params.id;
  try {
    const bills = await bill_items(bill_id);
    return res.status(200).json({ message: "success", data: bills });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};

const bills_by_supplier_id_get = async (req, res) => {
    const id = req.params.id;
     try {
       const bills = await bills_by_status("all",id);
       return res.status(200).json({ message: "success", data: bills });
     } catch (error) {
       return res.status(400).json({ message: "error", data: error });
     }
}

const uncleared_bills_get = async (req, res) => {
     try {
       const bills = await uncleared();
       return res.status(200).json({ message: "success", data: bills });
     } catch (error) {
       return res.status(400).json({ message: "error", data: error });
     }
}

const pending_bills_get = async (req, res) => {
     try {
       const bills = await bills_by_status("OPEN",null);
       return res.status(200).json({ message: "success", data: bills });
     } catch (error) {
       return res.status(400).json({ message: "error", data: error });
     }
}

const bills_create_post = async (req, res) => {
    let fields = req.body;
     try {
       const bills = await insert_bill(fields);
       return res.status(200).json({ message: "success", data: bills });
     } catch (error) {
     
       if (error.message === "duplicate") {
         return res.status(200).json({ message: "error", data: error.message });
       
       } else {
         return res.status(400).json({message:"error",data:error})
       }
       
     }
}

const bill_update = async (req, res) => {
    let fields = req.body;
    let id = req.params.id;
  try {
    const bills = await update_bill(id,fields);
    return res.status(200).json({ message: "success", data: bills });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};

const bills_pay_post = async (req, res) => {
   let fields = req.body;
   try {
     const bills = await pay_bill(fields);
     return res.status(200).json({ message: "success", data: bills });
   } catch (error) {
     if (error.message === "duplicate") {
       return res.status(200).json({ message: "error", data: error.message });
     } else {
       return res.status(200).json({ message: "error", data: error.message });
     }
   }
}

const bill_delete = async (req, res) => {
  const bill_id = req.params.id;
 
     try {
       const bills = await delete_bill(bill_id);
       return res.status(200).json({ message: "success", data: bills });
     } catch (error) {
       return res.status(400).json({ message: "error", data: error });
     }
}

const bill_approve_post = async(req, res) => {
    const {id,amount} = req.body;
 
     try {
       const bills = await approve_bill(id,amount);
       return res.status(200).json({ message: "success", data: bills });
     } catch (error) {
       return res.status(400).json({ message: "error", data: error });
     }
}

const pay_bill_report_post = async (req, res) => {
    const { supplier_id, start_date,end_date } = req.body;

    try {
      const bills = await pay_bills_report(start_date,end_date, supplier_id);
      return res.status(200).json({ message: "success", data: bills });
    } catch (error) {
      return res.status(400).json({ message: "error", data: error });
    }
}

const bills_by_params_post = async(req, res) => {
  
  const { status,
    supplier_id,
    start_date,
    end_date
  } = req.body;
  // console.log(`status: ${status} supplier_id:${supplier_id} start_date:${start_date}`);
  // return;
  try {
     const bills = await bills_by_params(status,supplier_id,start_date,end_date);
       return res.status(200).json({ message: "success", data: bills });
  } catch (error) {
     return res.status(400).json({ message: "error", data: error });
  }
}


module.exports = {
  all_bills_get,
  bills_by_supplier_id_get,
  uncleared_bills_get,
  pending_bills_get,
  bill_delete,
  bills_create_post,
  bill_details_get,
  bill_items_get,
  bill_update,
  bills_pay_post,
  bills_by_params_post,
  bill_approve_post,
  pay_bill_report_post,
};