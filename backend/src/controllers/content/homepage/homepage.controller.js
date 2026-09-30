import {
  HeroSlide,
  PromoCard,
  PromoGridItem,
  ShopByNeed,
} from "../../../models/index.js";

export const getHomepage = async (req, res) => {
  try {
    const [
      hero,
      promoCards,
      promoGrid,
      shopByNeed,
    ] = await Promise.all([
      HeroSlide.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean(),

      PromoCard.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean(),

      PromoGridItem.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean(),

      ShopByNeed.find({ isActive: true })
        .sort({ order: 1 })
        .lean(),
    ]);
console.log("promoGrid",promoGrid)
    return res.status(200).json({
      success: true,
      data: {
        hero,
        promoCards,
        promoGrid,
        shopByNeed,
      },
    });
  } catch (error) {
    console.error("Get Homepage Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load homepage content.",
      error: error.message,
    });
  }
};