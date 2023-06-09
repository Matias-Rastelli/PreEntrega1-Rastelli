import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Box, Container, Typography } from "@mui/material"
import { TypePokemon } from "../../common/TypePokemon/TypePokemon"
import { ItemCount } from "../../common/Count/ItemCount"
import { CartContext } from "../../../context/CartContext"
import { Loader } from "../../common/loader/Loader"
import Swal from "sweetalert2"
import { colorMap } from "../../../colorMap"
import { dataBase } from "../../../firebaseConfig"
import { collection, getDoc, doc } from "firebase/firestore"

export const ProductDetail = () => {
  const [itemSelected, setItemSelect] = useState({})

  const { id } = useParams()
  const { addToCart, getTotalByID } = useContext(CartContext)

  const cantidad = getTotalByID(id)

  useEffect(() => {
    const pokemonList = collection(dataBase, "pokemonList")
    const refDoc = doc(pokemonList, id)
    getDoc(refDoc)
      .then((res) => {
        setItemSelect({ ...res.data(), id: res.id })
      })
      .catch((err) => console.log(err))
  }, [id])

  function color(type) {
    const color1 = colorMap[type[0]]
    const color2 = colorMap[type[1]]
    if (type.length > 1) {
      return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
    }
    return `radial-gradient(circle, rgba(255,255,255,0.5) 0%, ${color1} 100%);`
  }

  const onAdd = (cantidad) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer)
        toast.addEventListener("mouseleave", Swal.resumeTimer)
      },
    })

    Toast.fire({
      icon: "success",
      title: `${itemSelected.title} agregado al carrito. 
      Cantidad en carrito: ${cantidad} 
      Total: $${itemSelected.price * cantidad} `,
    })

    let data = {
      ...itemSelected,
      quantity: cantidad,
    }
    addToCart(data)
  }
  if (!itemSelected.price) {
    return <Loader />
  }
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "row",
        border: "1px solid grey",
        marginTop: "20px",
        background: color(itemSelected.type),
      }}
    >
      <Box>
        <img src={itemSelected.img} alt={itemSelected.title} />
      </Box>
      <Box>
        <Typography variant="h2" component="h2" align="center">
          {itemSelected.title}
        </Typography>
        <TypePokemon type={itemSelected.type} font="14px" />
        <Typography fontSize={16}>{itemSelected.description}</Typography>
        <Box sx={{ borderTop: "1px solid grey" }}>
          <Typography variant="h6" component="h6">
            <b> Caracteristicas</b>
          </Typography>
          <Typography>HP: {itemSelected.stats?.hp ?? "Desconocido"}</Typography>
          <Typography>
            Ataque: {itemSelected.stats?.attack ?? "Desconocido"}
          </Typography>
          <Typography>
            Defensa: {itemSelected.stats?.defense ?? "Desconocido"}
          </Typography>
          <Typography>
            Ataque especial:{" "}
            {itemSelected.stats?.["special-attack"] ?? "Desconocido"}
          </Typography>
          <Typography>
            Defensa especial:{" "}
            {itemSelected.stats?.["special-defense"] ?? "Desconocido"}
          </Typography>
          <Typography>
            Velocidad: {itemSelected.stats?.speed ?? "Desconocido"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            borderTop: "1px solid grey",
          }}
        >
          <Box>
            <Typography fontSize={24}>
              <b>Precio:</b> ${itemSelected.price}
            </Typography>
            <Typography fontSize={24}>
              <b>Stock:</b> {itemSelected.stock} unid.
            </Typography>
          </Box>
          {itemSelected.stock > 0 ? (
            <ItemCount
              stock={itemSelected.stock}
              initial={cantidad}
              onAdd={onAdd}
            />
          ) : (
            <Typography variant="h5">Sin stock disponible</Typography>
          )}
        </Box>
      </Box>
    </Container>
  )
}
