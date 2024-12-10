namespace TodoApi.Models
{
    public class History
    {
        public int Id { get; set; }
        public int TodoId { get; set; }
        public string Date { get; set; }
        public string ChangeType { get; set; }
        public string ChangedBy { get; set; }
        public string Details { get; set; }
    }
}
