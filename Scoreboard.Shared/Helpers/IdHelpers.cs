using Scoreboard.Shared.Model;
using System.Security.Cryptography;
using System.Text;

namespace Scoreboard.Shared
{
    public static class IdHelpers
    {
        internal static readonly char[] chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".ToCharArray();

        public static string GenerateId(int size)
        {
            byte[] data = new byte[4 * size];
            using (var crypto = RandomNumberGenerator.Create())
            {
                crypto.GetBytes(data);
            }

            StringBuilder result = new StringBuilder(size);
            for (int i = 0; i < size; i++)
            {
                var rnd = BitConverter.ToUInt32(data, i * 4);
                var idx = rnd % chars.Length;

                result.Append(chars[idx]);
            }

            return result.ToString();
        }

        public static bool CheckUserCode(PartyExtended party, string playerId, string rejoinCode)
        {
            if (playerId == null || party.Players == null || !party.Players.Any())
            {
                return false;
            }

            PlayerExtended? player = party.Players.Where(x => x.Id== playerId).FirstOrDefault();

            if (player == null || (player.RejoinCode != null && player.RejoinCode.ToUpper() != rejoinCode.ToUpper()))
            {
                return false;
            }
            else
            {
                return true;
            }
        }
    }
}
