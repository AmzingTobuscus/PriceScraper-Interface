import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tProductEntry } from "../../../../server/models/product.models";
import { tImageEntry } from "../../../../server/models/image.models";
import { tPriceEntry } from "../../../../server/models/price.models";
import product_card_missing from "../../assets/product_card_missing.png";
import ProductTitle from "../../components/product-details/product-title";
import ProductImage from "../../components/product-details/product-image";
import ProductNotifyBtn from "../../components/product-details/product-notify-btn";
import ProductPrice from "../../components/product-details/product-price";

interface IProductPageProps {
  authToken: string;
}

const getProductName = (productId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const productResponse = await fetch(`/api/products/${productId}`);
      if (productResponse.ok) {
        const productJson: tProductEntry = await productResponse.json();
        resolve(productJson.Name);
      } else {
        resolve("");
      }
    } catch {
      reject("Error");
    }
  });
};

const getProductImageLink = (productId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageResponse = await fetch(`/api/images/product/${productId}`);
      if (imageResponse.ok) {
        const imageJson: tImageEntry = await imageResponse.json();
        if (imageJson === null) {
          resolve(product_card_missing);
        } else {
          resolve(imageJson.Link);
        }
      } else {
        reject("Error with image request");
      }
    } catch {
      reject("Error with image request");
    }
  });
};

const getAllPricesForProduct = (productId: string): Promise<tPriceEntry[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const priceResponse = await fetch(`/api/prices/${productId}`);
      if (priceResponse.ok) {
        const priceJsonResponse: tPriceEntry[] = await priceResponse.json();
        resolve(priceJsonResponse);
      } else {
        reject("Error with price request, product doesn't exist");
      }
    } catch {
      reject("Error with price request");
    }
  });
};

const ProductPage: React.FC<IProductPageProps> = (props) => {
  // Show product picture
  // Show product name
  // Show product current lowest price
  // Show product hisotircal lowest price (With date)
  // Show price chart for product
  // Show notify button (if logged in)

  const navigate = useNavigate();
  const { productId } = useParams();
  const [productName, setProductName] = useState<string>("");
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const fetchProductName = async (productId: string) => {
      try {
        const name = await getProductName(productId);
        setProductName(name);
      } catch {
        navigate("/", { replace: false });
      }
    };
    fetchProductName(productId);
  });

  const [productImage, setProductImage] =
    useState<string>(product_card_missing);
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const fetchProductImage = async (productId: string) => {
      try {
        const image = await getProductImageLink(productId);
        setProductImage(image);
      } catch {
        navigate("/", { replace: false });
      }
    };
    fetchProductImage(productId);
  });

  const [productPrices, setProductPrices] = useState<tPriceEntry[]>([]);
  useEffect(() => {
    if (productId === undefined) {
      navigate("/", { replace: false });
      return;
    }
    const fetchProductPrices = async (productId: string) => {
      try {
        const prices = await getAllPricesForProduct(productId);
        setProductPrices(prices);
      } catch {
        navigate("/", { replace: false });
      }
    };
    fetchProductPrices(productId);
  });

  return (
    <>
      <ProductTitle productName={productName} />
      <ProductImage
        imageLink={productImage}
        width={420}
        height={600}
        alt="Product card"
      />
      <ProductNotifyBtn btnText={"Buy Me!"} />
      <ProductPrice
        price={
          productPrices.length > 0
            ? productPrices[productPrices.length - 1].Price
            : 0
        }
      />
    </>
  );
};

export default ProductPage;
