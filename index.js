const express = require("express")
const app = express()

const PORT = 8080
let contador = 0
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("api"));

const routerProductos = express.Router();

const fs = require("fs")
class Contenedor{
    constructor(nombreArchivo){
        this.nombreArchivo = nombreArchivo
    }
    async save(producto){
        try {
            await fs.promises.writeFile(
                this.nombreArchivo, 
                JSON.stringify(producto, null, 2), 
                'utf-8'
                )
        } catch (e) {
            console.log(e)
        }
    }

    async saveNew(productoNuevo){
        let id;
        const contenido = await this.getAll()
        contenido.length==0 ?
        id = 1 :
        id =contenido.length + 1
        productoNuevo["id"]=id
        // buscamos el id más grande
        contenido.push(productoNuevo)
        this.save(contenido)
        return productoNuevo.id
    }

    async getAll(){
        try {
            const contenido = await fs.promises.readFile(this.nombreArchivo, 'utf-8')
            return JSON.parse(contenido)
        } catch (error) {
            
        }
    }

    async getById(id){
        const contenido = await this.getAll()
        const productoBuscado = contenido.find(producto => producto.id === id)
        if (!productoBuscado){
            return null
        } else {
            console.log(productoBuscado)
            return productoBuscado
        }
    }

    async put(id, producto) {
        try {
            const contenido = await this.getAll();
            const index = contenido.findIndex(prod => prod.id === prod.id);
            if(index >= 0){
                contenido.splice(index,1,{...producto, id});
                this.itemList = contenido;
                return producto;
            }else{
                console.log(`Producto con id: ${producto.id} no existe`)
                return null;
            }      
        }
        catch (err) {
            console.log("No se encontró un producto con ese id");
            return err;
        }
    }

    async deleteById(id){
        try {
            const contenido = await this.getAll()
            const nuevoContenido = contenido.filter(producto => producto.id != id)
            console.log(nuevoContenido)
            this.save(nuevoContenido)
        } catch (e) {
            return null
        }
    }
}

const contenedor = new Contenedor('./productos.txt')

const server = app.listen(PORT, ()=>{
    console.log("servidor iniciado")
})


routerProductos.get("/", async (req,res)=>{
    const mostrarProductos = await contenedor.getAll()
    res.json({ mostrarProductos });
})

routerProductos.post("/", (req,res)=>{
    productoEjemplo = {
        title: req.body.title,                                                                                                                                 
        price: parseFloat(req.body.price),                                                                                                                                     
        thumbnail: req.body.thumbnail
    }
    contenedor.saveNew(productoEjemplo)
    res.json({ productoEjemplo });
})

routerProductos.get("/:id", async (req,res)=>{
    const productoEliminado = await contenedor.getById(parseInt(req.params.id))
    productoEliminado==null ?
    res.json({ error : 'producto no encontrado' }) : 
    res.json({ productoEliminado });          
})

routerProductos.put('/:id', async (req,res) =>{
    const {title, price, thumbnail} = req.body;
    const id = await contenedor.put(Number(req.params.id),
    {title, price, thumbnail});
    res.json(id)
})

routerProductos.post("/:id", async (req,res)=>{
    const productoEncontrado = await contenedor.getById(parseInt(req.params.id))
        res.json({ productoEncontrado });
})

routerProductos.delete("/:id", async (req,res)=>{
    const productoEncontrado = await contenedor.getById(parseInt(req.params.id))
    if (productoEncontrado==null) {
        res.json({ error : 'producto no encontrado' })  
    }else{
        contenedor.deleteById(parseInt(req.params.id))
        res.json({ productoEliminado: productoEncontrado });
    }    
})


app.use("/api/productos", routerProductos);



// [
//     {
//       "title": "Globo Terráqueo",
//       "price": 345.67,
//       "thumbnail": "https://cdn3.iconfinder.com/data/icons/education-209/64/globe-earth-geograhy-planet-school-256.png",
//       "id": 3
//     },
//     {
//       "title": "Calculadora",
//       "price": 234.56,
//       "thumbnail": "https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-256.png",
//       "id": 2
//     },
//     {
//       "title": "Escuadra",
//       "price": 123.45,
//       "thumbnail": "https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png",
//       "id": 1
//     }
//   ]