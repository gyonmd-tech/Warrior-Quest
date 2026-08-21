import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';

export const inventoryRouter = Router();

// GET /api/inventory - Get all hero equipment
inventoryRouter.get('/', (_req: Request, res: Response) => {
  const equipment = dbStore.getEquipment();
  return res.json({ success: true, data: equipment });
});

// POST /api/inventory/equip/:id - Equip or unequip item
inventoryRouter.post('/equip/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const equipment = dbStore.getEquipment();
  const item = equipment.find((e) => e.id === id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Equipment item not found' });
  }

  const newEquipped = !item.equipped;

  // Unequip any existing item of the same type if equipping
  if (newEquipped) {
    equipment.forEach((e) => {
      if (e.type === item.type && e.id !== item.id && e.equipped) {
        dbStore.updateEquipmentItem(e.id, { equipped: false });
      }
    });
  }

  const updatedItem = dbStore.updateEquipmentItem(id, { equipped: newEquipped });
  return res.json({
    success: true,
    message: newEquipped ? `Equipped ${item.name}` : `Unequipped ${item.name}`,
    data: updatedItem,
    equipment: dbStore.getEquipment(),
  });
});

// POST /api/inventory/buy/:id - Buy item from merchant shop
inventoryRouter.post('/buy/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = dbStore.getUser();
  const equipment = dbStore.getEquipment();
  const item = equipment.find((e) => e.id === id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found in shop' });
  }

  if (item.purchased) {
    return res.status(400).json({ success: false, message: 'Item already purchased' });
  }

  if (item.priceGold && user.coins < item.priceGold) {
    return res.status(400).json({ success: false, message: 'Not enough Gold coins to purchase this item' });
  }

  if (item.priceGems && user.gems < item.priceGems) {
    return res.status(400).json({ success: false, message: 'Not enough Gems to purchase this item' });
  }

  const updatedUser = dbStore.updateUser(user.id, {
    coins: user.coins - (item.priceGold || 0),
    gems: user.gems - (item.priceGems || 0),
  });

  const updatedItem = dbStore.updateEquipmentItem(id, { purchased: true });

  return res.json({
    success: true,
    message: `Successfully purchased ${item.name}!`,
    data: {
      item: updatedItem,
      user: updatedUser,
      equipment: dbStore.getEquipment(),
    },
  });
});
