namespace OrganicHub.Api.Models.Inventory
{
    public enum InventorySourceType
    {
        PurchaseInvoice = 1,
        OpeningStock = 2,
        StockAdjustment = 3,
        TransferReceipt = 4,
        ProductionOutput = 5,
        SalesReturn = 6
    }

    public enum InventoryBatchStatus
    {
        Available = 1,
        PartiallyConsumed = 2,
        FullyConsumed = 3,
        Blocked = 4,
        Cancelled = 5
    }

    public enum InventoryReservationStatus
    {
        Reserved = 1,
        PartiallyIssued = 2,
        FullyIssued = 3,
        Released = 4,
        Cancelled = 5
    }
}