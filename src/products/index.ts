import { Hono } from 'hono'
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const ProductRoutes = new Hono()
const createdProductSchema = z.object({
    ID_Product: z.number("เป็นตัวเลขที่มีความยาว 5 ตัวอักษร"),
    Name: z.string("ความยาวไม่น้อยกว่า 5 ตัวอักษร"),
    sellprice: z.string()
    .regex(/^\d+\.\d{2}$/,"ราคาต้องเป็นทศนิยม 2 ตำแหน่ง")
    .transform((val) => Number(val)),
    costprice: z.string()
    .regex(/^\d+\.\d{2}$/,"ราคาต้องเป็นทศนิยม 2 ตำแหน่ง")
    .transform((val) => Number(val)),
    note : z.string()
        .optional(),
})
ProductRoutes.get('/' , (c) =>{
    return c.json({message: 'List of Role'})
})

ProductRoutes.post('/', 
    zValidator('json' , createdProductSchema)
    , async (c) =>{
    
    const body = await c.req.json()
    return c.json({ message: 'User created' , data: body})
})

export default ProductRoutes