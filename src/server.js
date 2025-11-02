import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./database/db.js";
import { favoritesTable } from "./database/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";

const app = express();

if (ENV.NODE_ENV === "production") job.start();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;
    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(newFavorite[0]);
  } catch (error) {
    console.log("error addding favorites", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, parseInt(recipeId))
        )
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.log("error removing a favorites", error);
    res
      .status(500)
      .json({ error: "Internal Server Error with removing a favorites" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const favorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json({ favorites });
  } catch (error) {
    console.log("error fetching favorites", error);
    res.status(500).json({ error: "Internal Server Error fetching favorites" });
  }
});

//server start
app.listen(ENV.PORT, () => {
  console.log(`Server is running on port http://localhost:${ENV.PORT}`);
});
