require "csv"
require "json"

# Generate the CSV with
# xlsx2csv
# or by opening in Numbers and exporting to CSV

# Columns:
DATE = 0
SNP = 1
DIVIDEND = 2
EARNINGS = 3
CPI = 4
DATE_FRACTION = 5
LONG_INTEREST_RATE = 6
REAL_PRICE = 7
REAL_DIVIDEND = 8
REAL_EARNINGS = 10

raw_csv = CSV.read(ARGV[0] || "shiller.csv")
data_rows = raw_csv.select {|r| r[DATE] =~ /^....\...?$/ }

p data_rows.length

abs_price = data_rows.map { |e| e[SNP].to_f }
abs_div = data_rows.map { |e| e[DIVIDEND].to_f }

cols = [SNP, DIVIDEND, REAL_PRICE, REAL_DIVIDEND, REAL_EARNINGS].map {|col| [col, data_rows.map { |e| e[col].to_f }]}.to_h

abs_file = <<END
{
"start":1871,
"name": "Absolute S&P 500",
"price": #{JSON.dump(cols[SNP])},
"dividend": #{JSON.dump(cols[DIVIDEND])}
}
END

real_file = <<END
{
"start":1871,
"name": "Inflation adjusted S&P 500",
"price": #{JSON.dump(cols[REAL_PRICE])},
"dividend": #{JSON.dump(cols[REAL_DIVIDEND])},
"earnings": #{JSON.dump(cols[REAL_EARNINGS])}
}
END

File.open("datasets/shiller_absolute.json", "w") { |io| io.print abs_file }
File.open("datasets/shiller_real.json", "w") { |io| io.print real_file }
