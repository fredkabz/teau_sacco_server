
const conn=require("./database2");

const monthNameFromNumber=async (num)=>{
    const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
    return months[num];
}

const compareDates = (d1, d2) => {
  let date1 = new Date(d1).getTime();
  let date2 = new Date(d2).getTime();

  if (date1 < date2) {
      return 2;
  } else if (date1 > date2) {
      return 1;
  } else {
      return 0;
  }
};


const queryPromise=async (sql,params)=>{
  
    try{
        const sqlQueryPromise=new Promise((resolve,reject)=>{
            if(params && params.length > 0){
             conn.query(sql,params,(error,result)=>{
                 if (error) {
                     console.log(error)
                     reject(error);
                 }else{
                     resolve(result);
                 }
             })
            }else{
                conn.query(sql,(error,result)=>{
                    if(error){
                        reject(error);
                    }else{
                        resolve(result);
                    }
                })
            }
            
         });
         return sqlQueryPromise;
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
   

   
}

module.exports={
    monthNameFromNumber,
    compareDates,
    queryPromise,
}