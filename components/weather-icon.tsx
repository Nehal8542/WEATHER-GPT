import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloudy,
  Sun,
  type LucideProps,
} from "lucide-react"

export function WeatherIcon({ condition, ...props }: { condition: string } & LucideProps) {
  const c = condition.toLowerCase()
  if (c.includes("thunder")) return <CloudLightning {...props} />
  if (c.includes("drizzle")) return <CloudDrizzle {...props} />
  if (c.includes("rain")) return <CloudRain {...props} />
  if (c.includes("snow")) return <CloudSnow {...props} />
  if (c.includes("mist") || c.includes("fog") || c.includes("haze") || c.includes("smoke"))
    return <CloudFog {...props} />
  if (c.includes("cloud")) return c.includes("few") || c.includes("scattered") ? <Cloudy {...props} /> : <Cloud {...props} />
  return <Sun {...props} />
}
