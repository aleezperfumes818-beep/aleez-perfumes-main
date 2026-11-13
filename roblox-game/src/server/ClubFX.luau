--!strict
-- Club Special Effects: Dynamic LED Dance Floor, Sweeping Spotlights & Smoke Cannons

local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Network = require(ReplicatedStorage.Shared.Network)

local ClubFX = {}

local NEON_PALETTE = {
    Color3.fromRGB(255, 30, 140),  -- Neon Magenta
    Color3.fromRGB(0, 240, 255),   -- Cyber Cyan
    Color3.fromRGB(150, 40, 255),  -- Electric Purple
    Color3.fromRGB(0, 255, 120),   -- Neon Lime
    Color3.fromRGB(255, 190, 30),  -- Golden Amber
    Color3.fromRGB(255, 60, 60),   -- Laser Red
}

local danceTiles = {}
local smokeEmitters = {}
local spotlights = {}

function ClubFX.registerDanceTile(tile: Part)
    table.insert(danceTiles, tile)
end

function ClubFX.registerSmokeEmitter(emitter: ParticleEmitter)
    table.insert(smokeEmitters, emitter)
end

function ClubFX.registerSpotlight(light: SpotLight)
    table.insert(spotlights, light)
end

function ClubFX.init()
    -- 1. Pulse & Cycle Dance Floor Tiles
    task.spawn(function()
        local colorIndex = 1
        while true do
            task.wait(0.6) -- Beat interval
            colorIndex = (colorIndex % #NEON_PALETTE) + 1
            local baseColor = NEON_PALETTE[colorIndex]

            for i, tile in ipairs(danceTiles) do
                local offset = (i + colorIndex) % #NEON_PALETTE + 1
                local tileColor = NEON_PALETTE[offset]
                tile.Color = tileColor
            end
        end
    end)

    -- 2. Sweep Spotlights & Lasers
    task.spawn(function()
        local angle = 0
        while true do
            task.wait(0.05)
            angle += 2
            local col = NEON_PALETTE[math.floor((angle / 60) % #NEON_PALETTE) + 1]
            for _, spot in ipairs(spotlights) do
                spot.Color = col
            end
        end
    end)

    -- 3. Smoke Cannon Trigger
    local smokeRemote = Network.getEvent("TriggerSmoke")
    smokeRemote.OnServerEvent:Connect(function(player: Player)
        ClubFX.blastSmoke()
        local notif = Network.getEvent("Notification")
        notif:FireAllClients("💨 DJ " .. player.DisplayName .. " BLASTED THE SMOKE CANNONS! 🔥")
    end)
end

function ClubFX.blastSmoke()
    for _, emitter in ipairs(smokeEmitters) do
        emitter.Enabled = true
    end
    task.delay(2.5, function()
        for _, emitter in ipairs(smokeEmitters) do
            emitter.Enabled = false
        end
    end)
end

return ClubFX
